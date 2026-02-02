const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 全局计数变量
let counter = 0;
let counterText;

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 初始化计数器
  counter = 0;
  
  // 在左上角创建文本对象显示计数
  counterText = this.add.text(20, 20, 'Count: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: {
      x: 10,
      y: 5
    }
  });
  
  // 监听整个场景的点击事件
  this.input.on('pointerdown', function(pointer) {
    // 每次点击计数+1
    counter++;
    
    // 更新文本显示
    counterText.setText('Count: ' + counter);
    
    // 可选：添加点击反馈效果
    // 在点击位置创建一个短暂的圆形反馈
    const clickFeedback = this.add.graphics();
    clickFeedback.fillStyle(0xffff00, 0.6);
    clickFeedback.fillCircle(pointer.x, pointer.y, 10);
    
    // 0.2秒后移除反馈效果
    this.time.delayedCall(200, () => {
      clickFeedback.destroy();
    });
  }, this);
  
  // 添加提示文本
  this.add.text(400, 300, 'Click anywhere to count!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);