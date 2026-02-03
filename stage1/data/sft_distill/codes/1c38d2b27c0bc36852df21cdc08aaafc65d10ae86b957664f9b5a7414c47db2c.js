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
  const text = this.add.text(400, 30, '点击画面生成菱形', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createDiamond(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建一个随机颜色的菱形
 * @param {Phaser.Scene} scene - 当前场景
 * @param {number} x - x 坐标
 * @param {number} y - y 坐标
 */
function createDiamond(scene, x, y) {
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const color = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 创建 Graphics 对象
  const graphics = scene.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(color, 1);
  
  // 菱形尺寸
  const size = 40;
  
  // 绘制菱形（四个顶点）
  // 菱形中心在 (0, 0)，顶点分别在上、右、下、左
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(2, 0xffffff, 0.8);
  graphics.strokePath();
  
  // 设置菱形位置
  graphics.setPosition(x, y);
  
  // 添加缩放动画效果
  graphics.setScale(0);
  scene.tweens.add({
    targets: graphics,
    scale: 1,
    duration: 200,
    ease: 'Back.easeOut'
  });
}

// 启动游戏
new Phaser.Game(config);