const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8800, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  
  // 生成纹理
  graphics.generateTexture('orangeRect', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const rect = this.physics.add.sprite(400, 300, 'orangeRect');
  
  // 设置初始速度（斜向移动，速度约为 200）
  // 使用勾股定理：√(141²+141²) ≈ 200
  rect.setVelocity(141, 141);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  rect.setBounce(1, 1);
  
  // 启用世界边界碰撞
  rect.setCollideWorldBounds(true);
  
  // 可选：添加文字说明
  this.add.text(10, 10, 'Orange rectangle bouncing at speed ~200', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);