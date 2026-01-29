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
  this.add.text(400, 30, '点击画面生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听鼠标点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建随机颜色的星形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createStar(scene, x, y) {
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);

  // 创建 Graphics 对象绘制星形
  const graphics = scene.add.graphics();
  graphics.fillStyle(colorHex, 1);
  
  // 绘制星形
  // fillStar(x, y, points, innerRadius, outerRadius, rotation)
  graphics.fillStar(0, 0, 5, 15, 35, 0);
  
  // 生成纹理
  const textureName = 'star_' + Date.now() + '_' + Math.random();
  graphics.generateTexture(textureName, 80, 80);
  
  // 销毁 Graphics 对象（已生成纹理，不再需要）
  graphics.destroy();
  
  // 创建星形精灵
  const star = scene.add.image(x, y, textureName);
  
  // 添加缩放动画效果
  scene.tweens.add({
    targets: star,
    scale: { from: 0, to: 1 },
    alpha: { from: 0.5, to: 1 },
    duration: 300,
    ease: 'Back.easeOut'
  });
  
  // 添加旋转动画
  scene.tweens.add({
    targets: star,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
}

// 启动游戏
new Phaser.Game(config);