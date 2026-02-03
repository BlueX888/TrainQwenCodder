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
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;

function preload() {
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 扩大世界边界，允许对象移动到更大的范围
  this.physics.world.setBounds(0, 0, 3000, 3000);
  
  // 创建玩家对象（圆形）
  player = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置圆形向右下方移动的速度
  player.setVelocity(150, 150);
  
  // 设置对象在世界边界内碰撞反弹
  player.setCollideWorldBounds(true);
  player.setBounce(1, 1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  
  // 相机跟随玩家对象，保持居中
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 添加背景网格以便观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 3000; x += 100) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(3000, y);
  }
  gridGraphics.strokePath();
  
  // 添加文字提示
  const text = this.add.text(16, 16, '相机跟随圆形移动', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 固定文字在相机视图中
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前物理系统会自动处理圆形的移动和碰撞
}

new Phaser.Game(config);