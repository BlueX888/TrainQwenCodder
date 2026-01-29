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
  // 添加标题文字提示
  this.add.text(400, 30, 'Click anywhere to create stars!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

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
  const randomColor = Phaser.Display.Color.RandomRGB();
  const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 设置填充样式
  graphics.fillStyle(colorHex, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius)
  // x, y: 星形中心位置
  // points: 星形的角数（5 表示五角星）
  // innerRadius: 内半径
  // outerRadius: 外半径
  graphics.fillStar(x, y, 5, 15, 35);
  
  // 添加淡入动画效果
  graphics.setAlpha(0);
  scene.tweens.add({
    targets: graphics,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });
  
  // 添加轻微的旋转动画
  scene.tweens.add({
    targets: graphics,
    angle: 360,
    duration: 2000,
    ease: 'Linear',
    repeat: -1
  });
}

// 启动游戏
new Phaser.Game(config);