function Variable(name) {
	return {
		name: name,
		s: name
	}
}

function Op(sign, left, right) {
	var res = {
		sign: sign,
		left: left,
		right: right
	}
	switch (sign) {
		case '!':
			res.s = sign + left.s;
			break;
		default:
			res.s = '(' + left.s + sign + right.s + ')';
	}
	return res;
}

function Negt(input) {
	switch (input[0]) {
		case '!':
			return Op('!', Negt(input.substring(1, input.length)));
		case '(':
			return Expr(input.substring(1, input.length - 1));
		default:
			return Variable(input);
	}
}

function Conj(input) {
	var balance = 0;
	for (var i = 0; i < input.length; i++)
		switch (input[i]) {
			case '(':
				balance++;
				break;
			case ')':
				balance--;
				break;
			case '&':
				if (balance === 0)
					return Op('&',
							  Conj(input.substring(0, i)),
							  Negt(input.substring(i + 1, input.length)));
		}
		return Negt(input);
}
function Disj(input) {
	var balance = 0;
	for (var i = 0; i < input.length; i++)
		switch (input[i]) {
			case '(':
				balance++;
				break;
			case ')':
				balance--;
				break;
			case '|':
				if (balance === 0)
					return Op('|',
							  Disj(input.substring(0, i)),
							  Conj(input.substring(i + 1, input.length)));
		}
		return Conj(input);
}

function Expr(input) {
	var balance = 0;
	for (var i = 0; i < input.length; i++)
		switch (input[i]) {
			case '(':
				balance++;
				break;
			case ')':
				balance--;
				break;
			case '-':
				if (balance === 0)
					return Op('->',
							  Disj(input.substring(0, i)),
							  Expr(input.substring(i + 2, input.length)));
		}
		return Disj(input);
}

var axioms = {
	1: function(r) {
		return  (r.sign === '->' &&
		r.right.sign === '->')
		&&
		(r.left.s === r.right.right.s);
	},
	2: function(r) {
		return (r.sign === '->' &&
		r.left.sign === '->' &&
		r.right.sign === '->' &&
		r.right.left.sign === '->' &&
		r.right.left.right.sign === '->' &&
		r.right.right.sign === '->')
		&&
		(r.left.left.s === r.right.left.left.s &&
		r.left.left.s === r.right.right.left.s)
		&&
		(r.left.right.s === r.right.left.right.left.s)
		&&
		(r.right.left.right.right.s === r.right.right.right.s);
	},
	3: function(r) {
		return (r.sign === '->' &&
		r.right.sign === '->' &&
		r.right.right.sign === '&')
		&&
		(r.left.s === r.right.right.left.s)
		&&
		(r.right.left.s === r.right.right.right.s);
	},
	4: function(r) {
		return (r.sign === '->' &&
		r.left.sign === '&')
		&&
		(r.left.left.s === r.right.s);
	},
	5: function(r) {
		return (r.sign === '->' &&
		r.left.sign === '&')
		&&
		(r.left.right.s === r.right.s);
	},
	6: function(r) {
		return (r.sign === '->' &&
		r.right.sign === '|')
		&&
		(r.left.s === r.right.left.s);
	},
	7: function(r) {
		return (r.sign === '->' &&
		r.right.sign === '|')
		&&
		(r.left.s === r.right.right.s);
	},
	8: function(r) {
		return (r.sign === '->' &&
		r.left.sign === '->' &&
		r.right.sign === '->' &&
		r.right.left.sign === '->' &&
		r.right.right.sign === '->' &&
		r.right.right.left.sign === '|')
		&&
		(r.left.left.s === r.right.right.left.left.s)
		&&
		(r.left.right.s === r.right.left.right.s &&
		r.left.right.s === r.right.right.right.s)
		&&
		(r.right.left.left.s === r.right.right.left.right.s);
	},
	9: function(r) {
		return (r.sign === '->' &&
		r.left.sign === '->' &&
		r.right.sign === '->' &&
		r.right.left.sign === '->' &&
		r.right.left.right.sign === '!' &&
		r.right.right.sign === '!')
		&&
		(r.left.left.s === r.right.left.left.s &&
		r.left.left.s === r.right.right.left.s)
		&&
		(r.left.right.s === r.right.left.right.left.s);
	},
	10: function(r) {
		return (r.sign === '->' &&
		r.left.sign === '!' &&
		r.left.left.sign === '!')
		&&
		(r.left.left.left.s === r.right.s);
	}
}

function isProvedByAxiom(r) {
	for (n in axioms)
		if (axioms[n](r))
			return n;
}

