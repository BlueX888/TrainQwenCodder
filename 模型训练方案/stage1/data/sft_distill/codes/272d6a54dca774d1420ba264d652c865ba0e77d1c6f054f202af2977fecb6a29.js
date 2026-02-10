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
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制一个等边三角形（顶点朝上）
  // 中心点在 (25, 25)，大小为 50x50
  graphics.fillTriangle(
    25, 5,      // 顶部顶点
    5, 45,      // 左下顶点
    45, 45      // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: triangle,        // 动画目标
    x: 700,                   // 目标 x 坐标（右侧）
    duration: 2000,           // 持续时间 2 秒
    ease: 'Linear',           // 线性缓动
    yoyo: true,               // 启用往返效果（到达终点后反向播放）
    repeat: -1                // 无限循环（-1 表示永远重复）
  });
  
  // 添加文字说明
  this.add.text(10, 10, 'Gray Triangle Tween Animation', {
    fontSize: '20px',
    color: '#ffffff'
  });
  
  this.add.text(10, 40, 'Moving left to right in 2 seconds, looping forever', {
    fontSize: '16px',
    color: '#cccccc'
  });
}

// 创建游戏实例
new Phaser.Game(config);