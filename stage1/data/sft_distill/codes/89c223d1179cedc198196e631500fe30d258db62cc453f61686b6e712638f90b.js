const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点为 (50, 50)，边长约 80
  graphics.fillTriangle(
    50, 10,      // 顶点
    10, 90,      // 左下
    90, 90       // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形 Sprite 并居中显示
  const triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 创建淡入淡出动画
  // duration: 2000ms (2秒完成一次完整的淡入淡出)
  // yoyo: true (往返动画，淡入后淡出)
  // repeat: -1 (无限循环)
  this.tweens.add({
    targets: triangle,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1000,     // 单程 1 秒（淡入或淡出）
    yoyo: true,         // 启用往返，淡出后再淡入
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使过渡更平滑
  });
}

new Phaser.Game(config);