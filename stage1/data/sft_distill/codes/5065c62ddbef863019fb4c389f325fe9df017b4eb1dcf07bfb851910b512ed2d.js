const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制白色三角形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点
  graphics.lineTo(60, 52);     // 右下角
  graphics.lineTo(0, 52);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 52);
  
  // 销毁 graphics 对象，因为纹理已生成
  graphics.destroy();
}

function create() {
  // 创建三角形精灵
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 500,               // 持续时间 0.5 秒
    yoyo: true,                  // 往返效果（到达目标后反向播放）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    ease: 'Linear'               // 线性缓动，匀速移动
  });
  
  // 添加说明文字
  this.add.text(10, 10, 'White triangle moving left-right in 0.5s loop', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);