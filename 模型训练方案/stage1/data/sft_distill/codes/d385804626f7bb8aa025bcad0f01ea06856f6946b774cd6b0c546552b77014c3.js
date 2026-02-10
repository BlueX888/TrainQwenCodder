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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 圆心在 (50, 50)，半径 50
  
  // 生成纹理
  graphics.generateTexture('grayCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'grayCircle');
  
  // 创建抖动动画
  // 抖动效果：通过快速左右移动实现
  this.tweens.add({
    targets: circle,
    x: '+=10', // 向右移动 10 像素
    duration: 50, // 单次移动持续 50 毫秒
    yoyo: true, // 往返运动
    repeat: 4, // 重复 4 次（总共 5 次移动，构成完整抖动）
    ease: 'Sine.easeInOut',
    loop: -1, // 无限循环
    loopDelay: 0 // 每次循环间隔 0 毫秒
  });
  
  // 添加说明文字
  this.add.text(400, 500, '灰色圆形抖动动画（0.5秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);