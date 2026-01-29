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
  this.add.text(400, 30, '点击画面生成星形', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    createStar(this, pointer.x, pointer.y);
  });
}

/**
 * 创建星形
 * @param {Phaser.Scene} scene - 场景对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 */
function createStar(scene, x, y) {
  // 生成随机颜色
  const color = Phaser.Display.Color.RandomRGB();
  const colorHex = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
  
  // 创建 Graphics 对象绘制星形
  const graphics = scene.add.graphics();
  graphics.fillStyle(colorHex, 1);
  
  // 星形参数
  const outerRadius = 30; // 外半径
  const innerRadius = 15; // 内半径
  const points = 5; // 五角星
  
  // 绘制星形路径
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(px, py);
    } else {
      graphics.lineTo(px, py);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（使用时间戳确保唯一性）
  const textureKey = 'star_' + Date.now() + '_' + Math.random();
  graphics.generateTexture(textureKey, outerRadius * 2, outerRadius * 2);
  
  // 销毁临时 Graphics 对象
  graphics.destroy();
  
  // 创建星形图像并设置位置
  const star = scene.add.image(x, y, textureKey);
  
  // 添加缩放动画效果
  scene.tweens.add({
    targets: star,
    scaleX: { from: 0, to: 1 },
    scaleY: { from: 0, to: 1 },
    angle: { from: 0, to: 360 },
    duration: 500,
    ease: 'Back.easeOut'
  });
  
  // 添加点击星形使其消失的交互
  star.setInteractive();
  star.on('pointerdown', () => {
    scene.tweens.add({
      targets: star,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        star.destroy();
        // 清理纹理以释放内存
        if (scene.textures.exists(textureKey)) {
          scene.textures.remove(textureKey);
        }
      }
    });
  });
}

new Phaser.Game(config);