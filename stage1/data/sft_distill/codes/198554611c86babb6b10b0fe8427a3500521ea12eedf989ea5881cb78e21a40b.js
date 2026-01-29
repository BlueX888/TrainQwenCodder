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
  // 无需预加载资源
}

function create() {
  // 添加标题提示
  const titleText = this.add.text(400, 30, '点击画面生成随机颜色的圆形', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  titleText.setOrigin(0.5, 0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 生成随机颜色
    const randomColor = Phaser.Display.Color.RandomRGB();
    const colorValue = Phaser.Display.Color.GetColor(
      randomColor.r,
      randomColor.g,
      randomColor.b
    );

    // 创建 Graphics 对象绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(colorValue, 1);
    
    // 在点击位置绘制圆形，半径为 20-40 之间的随机值
    const radius = Phaser.Math.Between(20, 40);
    graphics.fillCircle(pointer.x, pointer.y, radius);

    // 可选：添加淡出效果
    this.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        graphics.destroy(); // 销毁对象释放内存
      }
    });
  });

  // 添加操作提示
  const hintText = this.add.text(400, 570, '提示: 点击任意位置生成圆形', {
    fontSize: '16px',
    color: '#cccccc',
    fontFamily: 'Arial'
  });
  hintText.setOrigin(0.5, 0.5);
}

// 启动游戏
new Phaser.Game(config);