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
  // 使用 Graphics 绘制白色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制一个等边三角形（中心点在 (25, 25)）
  graphics.beginPath();
  graphics.moveTo(25, 5);      // 顶点
  graphics.lineTo(5, 45);      // 左下角
  graphics.lineTo(45, 45);     // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左移动到右，3秒完成，往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 3000,            // 持续时间 3 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 往返效果（到达终点后反向运动）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    onLoop: function() {
      // 可选：每次循环时的回调
      console.log('Triangle completed one cycle');
    }
  });
}

new Phaser.Game(config);