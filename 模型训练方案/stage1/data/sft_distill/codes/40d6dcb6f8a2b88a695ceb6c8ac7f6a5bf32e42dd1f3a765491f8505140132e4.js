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
  // 使用 Graphics 绘制紫色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  
  // 生成纹理
  graphics.generateTexture('purpleCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象，放置在屏幕左侧
  const circle = this.add.sprite(100, 300, 'purpleCircle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: circle,
    x: 700, // 移动到右侧位置
    duration: 2500, // 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果（到达终点后反向播放）
    repeat: -1 // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(10, 10, 'Purple Circle Tween Animation', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);