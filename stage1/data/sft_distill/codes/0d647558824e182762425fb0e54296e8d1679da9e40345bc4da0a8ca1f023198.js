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
  // 添加提示文字
  const text = this.add.text(400, 30, '点击画面生成随机颜色的矩形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色（0x000000 到 0xFFFFFF）
    const randomColor = Phaser.Math.Between(0x000000, 0xFFFFFF);
    
    // 生成随机矩形尺寸
    const width = Phaser.Math.Between(40, 120);
    const height = Phaser.Math.Between(40, 120);
    
    // 使用 Graphics 绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(randomColor, 1);
    
    // 在点击位置绘制矩形（以点击点为中心）
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

  // 添加额外提示：显示已生成的矩形数量
  let rectangleCount = 0;
  const countText = this.add.text(400, 570, '已生成矩形: 0', {
    fontSize: '18px',
    color: '#aaaaaa'
  });
  countText.setOrigin(0.5, 0.5);

  // 更新计数器
  this.input.on('pointerdown', () => {
    rectangleCount++;
    countText.setText(`已生成矩形: ${rectangleCount}`);
  });
}

new Phaser.Game(config);