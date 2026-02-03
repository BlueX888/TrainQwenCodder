// Phaser3 相机跟随示例：矩形向左上移动，相机跟随
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let graphics;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界为更大的区域，允许对象移动
  this.physics.world.setBounds(0, 0, 2400, 1800);
  
  // 使用 Graphics 绘制一个矩形并生成纹理
  graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建物理精灵，初始位置在世界中心
  player = this.physics.add.sprite(1200, 900, 'playerRect');
  
  // 设置速度：向左（负 x）和向上（负 y）移动
  player.setVelocity(-150, -150);
  
  // 设置精灵的碰撞边界
  player.setCollideWorldBounds(false); // 允许超出世界边界
  
  // 配置主相机
  const camera = this.cameras.main;
  
  // 设置相机边界与世界边界一致
  camera.setBounds(0, 0, 2400, 1800);
  
  // 让相机跟随玩家精灵，保持居中
  camera.startFollow(player, true, 0.1, 0.1);
  
  // 添加一些参考网格，帮助观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制网格线
  for (let x = 0; x <= 2400; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 1800);
  }
  for (let y = 0; y <= 1800; y += 100) {
    gridGraphics.lineBetween(0, y, 2400, y);
  }
  
  // 添加文本提示（固定在相机上）
  const infoText = this.add.text(10, 10, '相机跟随矩形移动\n矩形向左上方移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机视口，不随相机移动
  
  // 添加坐标显示文本
  this.coordText = this.add.text(10, 80, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新坐标显示
  if (player && this.coordText) {
    this.coordText.setText(
      `玩家位置: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
      `相机位置: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
    );
  }
  
  // 如果矩形移出世界边界，重置到中心并反向速度
  if (player.x < 0 || player.x > 2400 || player.y < 0 || player.y > 1800) {
    player.setPosition(1200, 900);
    // 随机改变移动方向
    const angle = Phaser.Math.Between(0, 360);
    const speed = 150;
    player.setVelocity(
      Math.cos(angle * Math.PI / 180) * speed,
      Math.sin(angle * Math.PI / 180) * speed
    );
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);