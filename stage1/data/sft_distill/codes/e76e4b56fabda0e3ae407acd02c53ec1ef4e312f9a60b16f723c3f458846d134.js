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
  // 使用 Graphics 绘制黄色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 80, 60); // 绘制矩形
  graphics.generateTexture('yellowRect', 80, 60); // 生成纹理
  graphics.destroy(); // 销毁 graphics 对象

  // 创建矩形精灵，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'yellowRect');

  // 创建补间动画：从左到右移动，往返循环
  this.tweens.add({
    targets: rect,
    x: 700, // 目标 x 坐标（屏幕右侧）
    duration: 4000, // 4秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });

  // 添加文字说明
  this.add.text(300, 50, '黄色矩形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);