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

let count = 0;
let countText;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建左上角的计数文本
  countText = this.add.text(20, 20, 'Count: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: {
      x: 10,
      y: 5
    }
  });

  // 添加提示文本
  this.add.text(400, 300, 'Click anywhere to count!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 监听整个场景的点击事件
  this.input.on('pointerdown', () => {
    // 计数增加
    count++;
    
    // 更新文本显示
    countText.setText('Count: ' + count);
    
    // 添加点击反馈动画
    this.tweens.add({
      targets: countText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  });
}

new Phaser.Game(config);