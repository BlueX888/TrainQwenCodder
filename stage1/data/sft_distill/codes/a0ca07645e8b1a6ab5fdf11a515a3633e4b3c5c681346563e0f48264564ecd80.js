const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制星形纹理
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 2000,          // 持续时间 2 秒
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动，匀速移动
  });
  
  // 添加文字说明
  this.add.text(300, 50, 'Star Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(300, 550, 'The star moves left to right in 2 seconds, then loops back', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);