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

let starCount = 0; // 用于生成唯一的纹理键名

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 添加提示文本
  const text = this.add.text(400, 50, '点击画面生成星形', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createStarAt(this, pointer.x, pointer.y);
  });
}

/**
 * 在指定位置创建星形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 */
function createStarAt(scene, x, y) {
  // 生成随机颜色
  const randomColor = Phaser.Display.Color.RandomRGB();
  const colorHex = Phaser.Display.Color.GetColor(randomColor.r, randomColor.g, randomColor.b);
  
  // 创建 Graphics 对象绘制星形
  const graphics = scene.add.graphics();
  graphics.fillStyle(colorHex, 1);
  
  // 绘制星形（5个尖角）
  // fillStar(x, y, points, innerRadius, outerRadius, [rotation])
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成唯一的纹理键名
  const textureKey = `star_${starCount++}`;
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture(textureKey, 100, 100);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在点击位置创建星形精灵
  const star = scene.add.image(x, y, textureKey);
  star.setOrigin(0.5);
  
  // 添加简单的缩放动画效果
  scene.tweens.add({
    targets: star,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 200,
    yoyo: true,
    ease: 'Sine.easeInOut'
  });
  
  // 添加淡入效果
  star.setAlpha(0);
  scene.tweens.add({
    targets: star,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });
}

new Phaser.Game(config);