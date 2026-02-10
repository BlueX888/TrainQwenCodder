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
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  graphics.generateTexture('grayCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'grayCircle');
  
  // 记录原始位置
  const originalX = circle.x;
  const originalY = circle.y;
  
  // 创建抖动动画
  this.tweens.add({
    targets: circle,
    x: {
      value: () => originalX + Phaser.Math.Between(-10, 10),
      duration: 50,
      ease: 'Linear'
    },
    y: {
      value: () => originalY + Phaser.Math.Between(-10, 10),
      duration: 50,
      ease: 'Linear'
    },
    yoyo: false,
    repeat: -1, // 无限循环
    repeatDelay: 0,
    duration: 500, // 0.5秒完成一次抖动周期
    onRepeat: () => {
      // 每次重复时重新设置随机目标位置
      circle.x = originalX;
      circle.y = originalY;
    }
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Gray Circle Shake Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);