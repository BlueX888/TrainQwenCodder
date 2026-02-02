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
  // 使用 Graphics 绘制青色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 60, 60); // 绘制 60x60 的矩形
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('cyanRect', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，节省资源
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(50, 300, 'cyanRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 750,                  // 目标 x 坐标（右侧位置）
    duration: 2500,          // 单程持续时间 2.5 秒
    yoyo: true,              // 启用往返效果（到达终点后返回起点）
    loop: -1,                // 无限循环（-1 表示永久循环）
    ease: 'Linear'           // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Cyan Rectangle Loop Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);