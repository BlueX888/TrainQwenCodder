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
  // 使用 Graphics 绘制蓝色菱形
  const graphics = this.add.graphics();
  
  // 设置蓝色填充
  graphics.fillStyle(0x0088ff, 1);
  
  // 绘制菱形（四个三角形组成）
  // 菱形中心在 (50, 50)，宽度100，高度100
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 上顶点
  graphics.lineTo(100, 50);    // 右顶点
  graphics.lineTo(50, 100);    // 下顶点
  graphics.lineTo(0, 50);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const diamond = this.add.sprite(50, 300, 'diamond');
  
  // 创建补间动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    x: 750,                     // 目标 x 坐标（右侧）
    duration: 4000,             // 持续时间 4 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 往返效果（到达终点后反向播放）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    repeat: 0                   // repeat 为 0，配合 yoyo 实现往返
  });
  
  // 添加文字说明
  this.add.text(300, 50, '蓝色菱形往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

// 启动游戏
new Phaser.Game(config);