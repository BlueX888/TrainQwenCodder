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
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('yellowRect', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建 Sprite 对象，放置在屏幕中央垂直位置，左侧水平位置
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: rect,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧位置）
    duration: 4000,          // 持续时间 4 秒
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(300, 50, 'Yellow Rectangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);