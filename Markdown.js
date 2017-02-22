function each(arr,callback){
	for(var i=0;i<arr.length;++i){

	callback && callback.call(arr[i],i,arr[i]);
	}
}

function Markdown(content){
	// 返回处理完成之后的html文本
// var that = Markdown;
	var temp=[];

	temp = content.split(/\n\s*?\n/);

	var that = Markdown;

/*	for(var i in that._handles.block){
		that._handles.block[i]()
	}*/

	each(temp,function(i,block){

		// var 
		var afterTrans=String(block);

		// 处理整块
		each(that._handles.block,function(i,e){
			var isMatch = e.isMatch(block);
			if(isMatch){
				console.log("匹配到:"+e.name);
				afterTrans = e.handle(block);
				return false;
			}
		});

		// 处理整行
		each(that._handles.line,function(i,e){
			if(e.isMatch(afterTrans)){
				console.log("匹配到:"+e.name);
				afterTrans = e.handle(afterTrans);
				return false;
			}
		});

		//处理行内的样式
		each(that._handles.inline,function(i,e){
			afterTrans =e.handle(afterTrans);
		});

		temp[i]=afterTrans;
	});

	return temp.join('');
};

//添加一种标记的处理方式
// type,isMatch,handle
Markdown.addkHandle=function(obj){
		Markdown._handles[obj.type].push(obj);
}

//将输入拆分成行数组
Markdown.splitToLine =function(content){
	 return content.split('\n');
}

// 处理方式
Markdown._handles={
	inline:[],
	line:[],
	block:[]
};


/*function eahc(arr,callback){
	for(var i=0;i<arr.length;++i){
		var result = callback && callback.call(arr[i],i.arr[i]);
		if(false === result){return;}
	}
}*/

function wrapByTag(tag,content){
	return '<'+tag+'>'+content+'</'+tag+'>';
}
/*
-列表
扩展规则：根据标记前面的空格数量/2来区分ul的等级
todo:如果空格太多会变成引用是什么鬼？
*/


/*
#标题h
*/
(function(){
	// console.log(Markdown);
	// console.log(each);

	var BEGIN = /^\s*(#{1,6}) /g;
	var END =/#* *$/g;	

	var isMatch = function(line){
		return !!line && !!line.match(BEGIN);
	}

	var handle = function(line){
		var level = line.match(BEGIN)[0].replace(BEGIN,'$1').length;
		var text = line.replace(BEGIN,'').replace(END,'');
		return wrapByTag('h'+level,text);
	}

	Markdown.addkHandle({
			name:"h",
			type:'line',
			isMatch:isMatch,
			handle:handle
	});
})();

/*
This is an H1
=============

This is an H2
-------------
*/
(function(){

	var H1 = /^\s*={2,}\s*$/g

	function handle(block){
		var arr = Markdown.splitToLine(block);
		each(arr,function(i,e){
			if(0==i){return;}

			var match = e.match(H1);
			if(match){
				// e = '';
				arr[i]='';
				arr[i-1] = wrapByTag('h1',arr[i-1]);
				return;
			}
		});

		return arr.join('');
	}


	Markdown.addkHandle({
			name:"SetextH",
			type:'block',
			isMatch:function(){return true;},
			handle:handle
	});
})()