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
  // 使用 Graphics 绘制绿色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制一个等边三角形（中心点在原点）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-25, 30);     // 左下角
  graphics.lineTo(25, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 50, 60);
  graphics.destroy(); // 销毁 Graphics 对象，只保留纹理
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右移动，然后往返循环
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 2500,              // 持续时间 2.5 秒
    yoyo: true,                  // 启用往返效果（到达终点后反向播放）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    ease: 'Linear'               // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Green Triangle Loop Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '2.5s per direction, infinite loop', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);