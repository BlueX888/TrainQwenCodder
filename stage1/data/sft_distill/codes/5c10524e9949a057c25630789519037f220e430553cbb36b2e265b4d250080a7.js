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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillEllipse(50, 40, 100, 80); // 在局部坐标绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('orangeEllipse', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵并居中显示
  const ellipse = this.add.sprite(400, 300, 'orangeEllipse');
  
  // 创建抖动动画效果
  // 使用多个快速的位置变化来模拟抖动
  this.tweens.add({
    targets: ellipse,
    x: '+=10', // 向右移动10像素
    y: '+=5',  // 向下移动5像素
    duration: 50, // 快速移动
    yoyo: true, // 来回移动
    repeat: -1, // 无限重复
    ease: 'Sine.easeInOut'
  });
  
  // 添加另一个方向的抖动以增强效果
  this.tweens.add({
    targets: ellipse,
    x: '-=8',
    y: '+=8',
    duration: 70,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    delay: 25 // 稍微延迟以产生不规则抖动
  });
  
  // 添加旋转抖动
  this.tweens.add({
    targets: ellipse,
    angle: { from: -3, to: 3 }, // 小角度旋转
    duration: 100,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 使用 Timeline 创建一个完整的2秒抖动周期
  // 先停止上面的 tweens，使用更精确的控制
  this.tweens.killTweensOf(ellipse);
  
  // 创建2秒循环的抖动序列
  const shakeTimeline = this.tweens.timeline({
    targets: ellipse,
    loop: -1, // 无限循环
    tweens: [
      {
        x: 410,
        y: 295,
        angle: 2,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 390,
        y: 305,
        angle: -2,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 405,
        y: 298,
        angle: 1.5,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 395,
        y: 302,
        angle: -1.5,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 408,
        y: 297,
        angle: 1,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 392,
        y: 303,
        angle: -1,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 403,
        y: 299,
        angle: 0.5,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      {
        x: 397,
        y: 301,
        angle: -0.5,
        duration: 50,
        ease: 'Sine.easeInOut'
      },
      // 逐渐减弱抖动幅度
      {
        x: 402,
        y: 299,
        angle: 0.3,
        duration: 100,
        ease: 'Sine.easeInOut'
      },
      {
        x: 398,
        y: 301,
        angle: -0.3,
        duration: 100,
        ease: 'Sine.easeInOut'
      },
      {
        x: 401,
        y: 300,
        angle: 0.1,
        duration: 150,
        ease: 'Sine.easeInOut'
      },
      {
        x: 399,
        y: 300,
        angle: -0.1,
        duration: 150,
        ease: 'Sine.easeInOut'
      },
      // 回到原位
      {
        x: 400,
        y: 300,
        angle: 0,
        duration: 200,
        ease: 'Sine.easeInOut'
      },
      // 停顿
      {
        x: 400,
        y: 300,
        angle: 0,
        duration: 800,
        ease: 'Linear'
      }
    ]
  });
  
  // 添加文字说明
  this.add.text(400, 500, '橙色椭圆抖动动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);