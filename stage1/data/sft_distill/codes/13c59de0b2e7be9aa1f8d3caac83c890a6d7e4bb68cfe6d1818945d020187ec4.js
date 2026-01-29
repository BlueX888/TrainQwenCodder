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
  
  // 绘制一个指向右的三角形（相对于中心点）
  graphics.fillTriangle(
    0, -30,    // 顶部顶点
    0, 30,     // 底部顶点
    50, 0      // 右侧顶点
  );
  
  // 将 graphics 转换为纹理以便于补间动画操作
  graphics.generateTexture('triangle', 50, 60);
  graphics.destroy(); // 销毁原始 graphics 对象
  
  // 创建三角形精灵
  const triangle = this.add.image(100, 300, 'triangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    x: 700,                      // 目标 x 坐标（从左到右）
    duration: 2500,              // 动画时长 2.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 启用往返效果（到达终点后反向播放）
    repeat: -1                   // 无限循环（-1 表示永远重复）
  });
}

new Phaser.Game(config);