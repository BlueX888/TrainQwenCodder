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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 添加提示文本
  const text = this.add.text(400, 30, '点击画面生成随机颜色矩形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（0x000000 到 0xffffff）
    const randomColor = Phaser.Math.Between(0x000000, 0xffffff);
    
    // 生成随机矩形尺寸（宽度 30-100，高度 30-100）
    const width = Phaser.Math.Between(30, 100);
    const height = Phaser.Math.Between(30, 100);
    
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(randomColor, 1);
    
    // 以点击位置为中心绘制矩形
    graphics.fillRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );
    
    // 可选：添加边框使矩形更明显
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeRect(
      pointer.x - width / 2,
      pointer.y - height / 2,
      width,
      height
    );
    
    // 可选：添加淡入动画效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });
  });
}

new Phaser.Game(config);