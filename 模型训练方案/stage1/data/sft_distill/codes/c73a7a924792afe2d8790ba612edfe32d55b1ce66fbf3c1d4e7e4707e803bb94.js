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
  // 使用 Graphics 创建红色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('redRect', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建红色矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'redRect');
  
  // 创建抖动动画效果
  // 通过在短时间内快速改变位置来模拟抖动
  this.tweens.add({
    targets: rect,
    x: '+=10',  // 向右偏移
    y: '+=5',   // 向下偏移
    duration: 50,  // 快速移动
    yoyo: true,    // 往返运动
    repeat: -1,    // 无限重复
    ease: 'Sine.easeInOut'
  });
  
  // 创建整体的循环时间线（2秒一个周期）
  // 使用多个方向的抖动来创建更真实的效果
  this.tweens.timeline({
    targets: rect,
    loop: -1,  // 无限循环
    tweens: [
      {
        x: '+=8',
        y: '+=6',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '-=16',
        y: '-=4',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '+=12',
        y: '-=8',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '-=8',
        y: '+=10',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '+=6',
        y: '-=6',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '-=10',
        y: '+=4',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '+=8',
        y: '-=2',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '-=6',
        y: '+=3',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '+=4',
        y: '-=5',
        duration: 100,
        ease: 'Power1'
      },
      {
        x: '-=2',
        y: '+=2',
        duration: 100,
        ease: 'Power1'
      },
      // 回到原位
      {
        x: 400,
        y: 300,
        duration: 1000,
        ease: 'Sine.easeOut'
      }
    ]
  });
  
  // 添加说明文字
  this.add.text(400, 50, '红色矩形抖动动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);