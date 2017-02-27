function each(arr, callback) {
        for (var i = 0; i < arr.length; ++i) {
                if (false === (callback && callback.call(arr[i], i, arr[i]))) {
                        return;
                }
        }
}

function Markdown(content) {
        // 返回处理完成之后的html文本
        // var that = Markdown;
        var temp = [];

        temp = content.split(/\n\s*?\n/);

        var that = Markdown;

        /*	for(var i in that._handles.block){
        		that._handles.block[i]()
        	}*/

        each(temp, function(i, block) {
                console.log(block);

                // var 
                var afterTrans = String(block);

                // 处理整块
                each(that._handles.block, function(i, e) {
                        var isMatch = e.isMatch(block);
                        if (isMatch) {
                                console.log("匹配到:" + e.name);
                                afterTrans = e.handle(block);
                                return;
                        }
                });

                // 处理整行
                each(that._handles.line, function(i, e) {
                        if (e.isMatch(afterTrans)) {
                                console.log("匹配到:" + e.name);
                                afterTrans = e.handle(afterTrans);
                                return false;
                        }
                });

                //处理行内的样式
                each(that._handles.inline, function(i, e) {
                        afterTrans = e.handle(afterTrans);
                });

                temp[i] = afterTrans;
        });

        return temp.join('');
};

//添加一种标记的处理方式
// type,isMatch,handle
Markdown.addkHandle = function(obj) {
        Markdown._handles[obj.type].push(obj);
}

//将输入拆分成行数组
Markdown.splitToLine = function(content) {
        return content.split('\n');
}

// 与上面的函数成对匹配
Markdown.joinToLine = function(arr) {
        return arr.join('\n');
}

// 处理方式
Markdown._handles = {
        inline: [],
        line: [],
        block: []
};


/*function eahc(arr,callback){
	for(var i=0;i<arr.length;++i){
		var result = callback && callback.call(arr[i],i.arr[i]);
		if(false === result){return;}
	}
}*/

function wrapByTag(tag, content) {
        return '<' + tag + '>' + content + '</' + tag + '>';
}
/*
-列表
扩展规则：根据标记前面的空格数量/2来区分ul的等级
todo:如果空格太多会变成引用是什么鬼？
*/


/*
#标题h
*/
(function() {
        // console.log(Markdown);
        // console.log(each);

        var BEGIN = /^\s*(#{1,6}) /g;
        var END = /#* *$/g;

        var isMatch = function(line) {
                return !!line && !!line.match(BEGIN);
        }

        var handle = function(line) {
                var level = line.match(BEGIN)[0].replace(BEGIN, '$1').length;
                var text = line.replace(BEGIN, '').replace(END, '');
                return wrapByTag('h' + level, text);
        }

        Markdown.addkHandle({
                name: "h",
                type: 'line',
                isMatch: isMatch,
                handle: handle
        });
})();

/*
This is an H1
=============

This is an H2
-------------
*/
(function() {

        var H1 = /^\s*={2,}\s*$/g

        function handle(block) {
                var arr = Markdown.splitToLine(block);
                each(arr, function(i, e) {
                        if (0 == i) {
                                return;
                        }

                        var match = e.match(H1);
                        if (match) {
                                // e = '';
                                arr[i] = '';
                                arr[i - 1] = wrapByTag('h1', arr[i - 1]);
                                return;
                        }
                });

                return arr.join('');
        }


        Markdown.addkHandle({
                name: "SetextH",
                type: 'block',
                isMatch: function() {
                        return true;
                },
                handle: handle
        });
})();


/*
todo:
> 引用 Blockquotes


*/ //*

/*
+ 无序列表
- 无序列表
* 无序列表
//TODO:2 暂时不考虑嵌套列表
*/
(function() {
        var SPLIT = /\n\s*[\*\-\+] /g;


        function handle(block) {
                var arr = ('\n' + block).split(SPLIT);

                // The first one maybe not a li
                var isFirstLi = '' === arr[0];

                // console.log(arr);
                each(arr, function(index, element) {
                        if (!isFirstLi && 0 === index) {
                                return;
                        }
                        arr[index] = wrapByTag('li', element);
                });

                if (isFirstLi) {
                        wrapByTag('ul', arr.join(''));
                }

                return arr[0] + wrapByTag('ul', arr.slice(1).join(''));
        }

        Markdown.addkHandle({
                name: "unorderList",
                type: 'block',
                isMatch: function(content) {
                        return !!content.match(SPLIT);
                },
                handle: handle
        });
})();


/*
1. 有序列表
//TODO:2 暂时不考虑嵌套列表
//目前与无序列表的区别仅仅是SPLIT跟包裹的标签不同，考虑到以后可能会进行缩进等更复杂的操作，因此还是把代码复制了一遍
*/

(function() {

        var SPLIT = /\n\s*[0-9]*\. /g;

        function handle(block) {
                var arr = ('\n' + block).split(SPLIT);

                // The first one maybe not a li
                var isFirstLi = '' === arr[0];

                // console.log(arr);
                each(arr, function(index, element) {
                        if (!isFirstLi && 0 === index) {
                                return;
                        }
                        arr[index] = wrapByTag('li', element);
                });

                if (isFirstLi) {
                        wrapByTag('ol', arr.join(''));
                }

                return arr[0] + wrapByTag('ol', arr.slice(1).join(''));
        }

        Markdown.addkHandle({
                name: "orderList",
                type: 'block',
                isMatch: function(content) {
                        return !!content.match(SPLIT);
                },
                handle: handle
        });
})();

/*
代码区块 缩进 4 个空格或是 1 个制表符
//atom 内是空行+4空格或者2制表，暂时按照一个制表来处理
*/
(function() {
        // return;

        var BEGIN = /^    |\t/g;

        function isMatch(content) {
                console.log(content);
                var arr = Markdown.splitToLine(content);
                return BEGIN.test(arr[0]);
        }

        function handle(block) {
                var arr = Markdown.splitToLine(block);
                // var inRange =true;
                var codeLine = [];

                each(arr, function(index, element) {
                        if (element.match(BEGIN)) {
                                codeLine.push(element.replace(BEGIN, ''));
                        } else {
                                arr.splice(0, index);
                                return false;
                        }

                });
                return wrapByTag('pre', wrapByTag('code', Markdown.joinToLine(codeLine))) + Markdown.joinToLine(arr);
        }

        Markdown.addkHandle({
                name: "code",
                type: 'block',
                isMatch: isMatch,
                handle: handle
        });

})();

/*
三个以上的星号、减号、底线来建立一个分隔线，行内不能有其他东西
*/

// (function() {





Markdown.addkHandle({
        name: "hr",
        type: 'line',
        isMatch: function(line) {
                var REG = /[\*\+\-]/g;
                return "" === line.replace(REG, "").replace(/\s/g, "") && 2 < (line.match(REG) || []).length
        },
        handle: function() {
                return "<hr>"
        }
});
// })();

/*
TODO:
链接
*/

(function() {
        // 名字需要做完全匹配，因为[]可能也是名字的一部分，但是地址不用
        // 两者都需要做换行匹配
        function isMatch(block) {
                return -1 < block.indexOf('](');
        }

        // 返回未处理完的子串
        function subHandle(block) {
        	var bracketStack = [];
        	var linkText = "";
        	// var match = block.match(/\]\(/g);
        	// if(!match){return;}
        	var _start = -1;
        	var _end =  block.indexOf('](');
        	if(-1 === _end){
        		return {
        			handled:block,
        			unhandle:''
        		};
        	}
        	var text='';
        	for(var i = _end;_start<i;--i){
        			switch(block[i]){
        				case ']':
        					bracketStack.push(']');
        					break;
        				case '[':
        					bracketStack.pop();
        					if(0 == bracketStack.length){
        						
        						_start =i;
        					}
        					break;
        				default:
							text = block[i]+text;
        					break;
        			}
        	}

        	var subStr = block.slice(_end+2);

			var hrefEnd = subStr.indexOf(')');
			// console.log(block.slice(2+start+hrefEnd));

			var title =  block.slice(_start+1,_end);
			var href = subStr.slice(0,hrefEnd);
				
			return {
					handled: block.slice(0,_start)+'<a href="'+href+'">'+title+'</a>',
					unhandle:subStr.slice(hrefEnd+1)
				}
        }

        function handle(block){
        	var resultStr='';
        	var result={
        		unhandle:block
        	}

        	do{
				result = subHandle(result.unhandle);
				resultStr =resultStr+result.handled;
				// debugger;
        	}while(''!=result.unhandle)


        	return resultStr;
        	
        }

        Markdown.addkHandle({
                name: "inlineLink",
                type: 'block',
                isMatch: isMatch,
                handle: handle
        });
})();

/*
TODO:强调
*/

/*
TODO:
`行内代码`
*/

/*
TODO:
图片
*/

/*
TODO:
自动链接
*/

/*
TODO:
反斜杠
*/
