function Variable(name) {
	return {
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

function isAxiom(r) {
	for (n in axioms)
		if (axioms[n](r))
			return n;
}

var fs = require('fs');
var inputStrings = fs.readFileSync('input.txt', 'utf8').split('\n');

var hypothesyString = inputStrings.shift().replace(/[\s\r]/g, '');
var output = String(hypothesyString);

var hypothesis = hypothesyString.split(/,|\|-/);

var hypothesyNumber = {};
for (var i = 0; i < hypothesis.length - 1; i++)
	hypothesyNumber[Expr(hypothesis[i]).s] = i + 1;

var rm = {};
var lm = {};
var exps = {};

function isMP(e) {
	for (index in rm[e.s]) {
		var j = rm[e.s][index];
		var i = lm[exps[j].left.s];
		if (i !== undefined)
			return {
				i: i,
				j: j
			}
	}
}

function checkExpr(e, i) {
	output += '\n(' + (i) + ') ' + e.s;
	
	var res = isAxiom(e);
	if (res !== undefined) {
		output += ' (Сх. акс. ' + res + ')';
		return;
	}
	
	res = hypothesyNumber[e.s];
	if (res !== undefined) {
		output += ' (Предп. ' + res + ')';
		return;
	}
	
	res = isMP(e);
	if (res !== undefined) {
		output += ' (M.P. ' + res.i + ', ' + res.j + ')';
		return;
	}
	
	output += ' (Не доказано)';
}

for (var i = 1; i < inputStrings.length; i++) {
	var e = Expr(inputStrings[i - 1].replace(/[\s\r]/g, ''));
	
	checkExpr(e, i);
	
	if (lm[e.s] === undefined)
		lm[e.s] = i;
	if (e.sign === '->') {
		if (rm[e.right.s] === undefined) {
			var a = [];
			a.push(i);
			rm[e.right.s] = a;
		} else {
			rm[e.right.s].push(i);
		}
	}
	exps[i] = e;
}

fs.writeFileSync('output.txt', output);