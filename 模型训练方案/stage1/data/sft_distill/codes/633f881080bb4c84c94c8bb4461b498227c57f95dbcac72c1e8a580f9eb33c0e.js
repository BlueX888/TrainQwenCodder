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
  const text = this.add.text(400, 30, '点击画面生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个随机颜色的星形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 */
function createStar(scene, x, y) {
  // 生成随机颜色
  const color = Phaser.Display.Color.RandomRGB();
  const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 设置填充样式
  graphics.fillStyle(hexColor, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius, fillColor)
  // points: 星形的角数
  // innerRadius: 内半径
  // outerRadius: 外半径
  graphics.fillStar(x, y, 5, 15, 30);
  
  // 添加简单的缩放动画效果
  graphics.setScale(0);
  scene.tweens.add({
    targets: graphics,
    scaleX: 1,
    scaleY: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
}

// 创建游戏实例
new Phaser.Game(config);