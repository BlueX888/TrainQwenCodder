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
  // 使用 Graphics 绘制橙色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制一个等边三角形（指向右侧）
  graphics.beginPath();
  graphics.moveTo(0, -30);    // 顶点
  graphics.lineTo(40, 0);     // 右顶点
  graphics.lineTo(0, 30);     // 底点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建三角形精灵
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    x: 700,                      // 移动到 x = 700 的位置
    duration: 2500,              // 持续时间 2.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往返效果（到达终点后反向播放）
    loop: -1,                    // 无限循环（-1 表示永久循环）
    onLoop: function() {
      // 可选：每次循环时的回调
      console.log('Triangle completed one loop cycle');
    }
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Orange Triangle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The triangle moves left-right continuously (2.5s each way)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);