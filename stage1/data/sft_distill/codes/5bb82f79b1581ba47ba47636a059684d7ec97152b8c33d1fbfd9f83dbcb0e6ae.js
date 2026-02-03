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
let counterText;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建计数器文本显示在左上角
  counterText = this.add.text(20, 20, 'Count: 0', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });

  // 监听整个场景的点击事件
  this.input.on('pointerdown', function(pointer) {
    // 每次点击计数加1
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
      ease: 'Power2'
    });
  }, this);

  // 添加提示文本
  this.add.text(400, 300, 'Click anywhere to count!', {
    fontSize: '24px',
    color: '#888888',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);