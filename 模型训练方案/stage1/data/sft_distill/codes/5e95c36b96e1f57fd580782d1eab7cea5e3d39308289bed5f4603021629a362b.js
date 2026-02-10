const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制一个大的网格背景
  for (let x = 0; x < 5000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 2000);
  }
  for (let y = 0; y < 2000; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(5000, y);
  }
  graphics.strokePath();
  
  // 添加一些参考点（不同颜色的矩形）
  for (let i = 0; i < 10; i++) {
    const refGraphics = this.add.graphics();
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    refGraphics.fillStyle(colors[i % colors.length], 0.5);
    refGraphics.fillRect(i * 500, 200, 80, 80);
  }
  
  // 使用 Graphics 创建圆形纹理
  const circleGraphics = this.add.graphics();
  circleGraphics.fillStyle(0xff6b6b, 1);
  circleGraphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  
  // 生成纹理
  circleGraphics.generateTexture('playerCircle', 50, 50);
  circleGraphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 设置世界边界（扩大场景范围）
  this.cameras.main.setBounds(0, 0, 5000, 2000);
  
  // 让相机跟随玩家
  this.cameras.main.startFollow(player);
  
  // 可选：设置跟随的平滑度（lerp 值，0-1 之间，值越小越平滑）
  // this.cameras.main.setLerp(0.1, 0.1);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, 'Camera Following Circle', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让玩家持续向右移动
  player.x += moveSpeed;
  
  // 可选：当玩家移动到边界时重置位置
  if (player.x > 4900) {
    player.x = 100;
  }
}

new Phaser.Game(config);