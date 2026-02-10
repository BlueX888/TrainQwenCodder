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
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 80, 60); // 绘制 80x60 的矩形
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 1000,          // 持续时间 1 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    loop: -1,                // 无限循环（-1 表示永久循环）
    repeat: 0                // yoyo 模式下不需要额外的 repeat
  });
  
  // 添加提示文本
  this.add.text(400, 50, '黄色矩形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);