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
  // 监听画面点击事件
  this.input.on('pointerdown', (pointer) => {
    createStarAtPosition.call(this, pointer.x, pointer.y);
  });

  // 显示提示文本
  const text = this.add.text(400, 30, 'Click anywhere to create stars!', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

/**
 * 在指定位置创建随机颜色的星形
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createStarAtPosition(x, y) {
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);

  // 创建 Graphics 对象绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(colorHex, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius, rotation)
  graphics.fillStar(x, y, 5, 15, 35, 0);

  // 可选：添加描边效果
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokeStar(x, y, 5, 15, 35, 0);

  // 添加简单的缩放动画效果
  graphics.setScale(0);
  this.tweens.add({
    targets: graphics,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });

  // 可选：添加旋转动画
  this.tweens.add({
    targets: graphics,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
}

// 启动游戏
new Phaser.Game(config);