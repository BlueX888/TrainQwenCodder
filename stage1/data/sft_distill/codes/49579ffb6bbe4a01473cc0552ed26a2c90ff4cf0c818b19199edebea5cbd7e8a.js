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
  // 不需要预加载外部资源
}

function create() {
  // 添加标题文字提示
  this.add.text(400, 30, 'Click anywhere to create stars!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听鼠标点击事件
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
  const colorValue = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 设置填充样式
  graphics.fillStyle(colorValue, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius)
  // points: 星形的尖角数量
  // innerRadius: 内半径
  // outerRadius: 外半径
  graphics.fillStar(x, y, 5, 15, 30);
  
  // 添加一个简单的缩放动画效果
  graphics.setScale(0);
  scene.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 可选：添加星形边框使其更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokeStar(x, y, 5, 15, 30);
}

// 创建游戏实例
new Phaser.Game(config);