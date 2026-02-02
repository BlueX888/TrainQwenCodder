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
  // 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(50, 50, 50); // 半径 50 的圆形
  graphics.generateTexture('cyanCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 在屏幕中心创建青色圆形精灵
  const circle = this.add.sprite(400, 300, 'cyanCircle');
  
  // 记录初始位置
  const originX = circle.x;
  const originY = circle.y;
  
  // 创建抖动动画效果
  // 使用多个连续的 tween 来模拟抖动
  this.tweens.add({
    targets: circle,
    x: {
      value: () => originX + Phaser.Math.Between(-10, 10),
      duration: 50,
      ease: 'Linear'
    },
    y: {
      value: () => originY + Phaser.Math.Between(-10, 10),
      duration: 50,
      ease: 'Linear'
    },
    repeat: -1, // 无限循环
    yoyo: false,
    duration: 50, // 每次抖动 50ms
    onRepeat: () => {
      // 每次重复时重新计算随机偏移
      circle.x = originX + Phaser.Math.Between(-10, 10);
      circle.y = originY + Phaser.Math.Between(-10, 10);
    }
  });
  
  // 添加一个周期性重置，确保整体循环是 3 秒
  this.time.addEvent({
    delay: 3000,
    callback: () => {
      // 每 3 秒重置一次位置到中心，然后继续抖动
      circle.x = originX;
      circle.y = originY;
    },
    loop: true
  });
  
  // 添加说明文字
  this.add.text(400, 50, '青色圆形抖动动画\n3秒循环', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);