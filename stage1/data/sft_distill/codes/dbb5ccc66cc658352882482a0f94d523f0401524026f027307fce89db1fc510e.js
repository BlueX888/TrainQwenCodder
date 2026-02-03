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

// 计数器变量
let counter = 0;
let counterText = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建计数器文本显示在左上角
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

  // 监听整个画面的点击事件
  this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
    // 计数器加1
    counter++;
    
    // 更新文本显示
    counterText.setText('Count: ' + counter);
    
    // 可选：添加点击反馈效果
    counterText.setScale(1.2);
    this.tweens.add({
      targets: counterText,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power1'
    });
  });

  // 添加提示文本
  this.add.text(400, 300, 'Click anywhere to count!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);