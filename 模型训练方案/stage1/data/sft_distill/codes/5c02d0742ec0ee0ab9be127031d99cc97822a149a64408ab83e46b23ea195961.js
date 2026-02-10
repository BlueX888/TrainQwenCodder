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
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（等边三角形，中心在原点）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-26, 15);     // 左下角
  graphics.lineTo(26, 15);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 52, 45);
  graphics.destroy();
  
  // 创建三角形精灵，放置在左侧起始位置
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左移动到右，然后往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 500,             // 持续时间 0.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);