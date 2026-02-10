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
  // 使用 Graphics 绘制蓝色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillCircle(50, 50, 50);
  
  // 生成纹理
  graphics.generateTexture('blueCircle', 100, 100);
  graphics.destroy();
  
  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'blueCircle');
  
  // 创建抖动动画
  // 使用多个属性同时抖动来模拟抖动效果
  this.tweens.add({
    targets: circle,
    x: {
      from: 400,
      to: 400,
      ease: 'Sine.easeInOut',
      duration: 50,
      yoyo: true,
      repeat: 9, // 重复9次，加上第一次共10次，总计1秒
      onUpdate: function(tween, target) {
        // 在更新时添加随机偏移实现抖动
        const offset = Phaser.Math.Between(-5, 5);
        target.x = 400 + offset;
      }
    },
    y: {
      from: 300,
      to: 300,
      ease: 'Sine.easeInOut',
      duration: 50,
      yoyo: true,
      repeat: 9,
      onUpdate: function(tween, target) {
        const offset = Phaser.Math.Between(-5, 5);
        target.y = 300 + offset;
      }
    },
    loop: -1, // 无限循环
    loopDelay: 0
  });
  
  // 添加文字说明
  this.add.text(400, 500, '抖动动画效果 (1秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);