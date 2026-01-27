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
  // 添加标题提示
  const titleText = this.add.text(400, 30, '点击画面生成随机颜色的圆形', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5);

  // 监听画面点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorHex = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorHex, 1);
    
    // 在点击位置绘制圆形，半径为 30
    const radius = 30;
    graphics.fillCircle(pointer.x, pointer.y, radius);

    // 可选：添加淡入动画效果
    graphics.setAlpha(0);
    this.tweens.add({
      targets: graphics,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });

    // 可选：添加缩放动画效果
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  });

  // 添加计数器显示生成的圆形数量
  let circleCount = 0;
  const countText = this.add.text(400, 570, '圆形数量: 0', {
    fontSize: '18px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  countText.setOrigin(0.5);

  // 更新计数器
  this.input.on('pointerdown', () => {
    circleCount++;
    countText.setText(`圆形数量: ${circleCount}`);
  });
}

// 创建游戏实例
new Phaser.Game(config);