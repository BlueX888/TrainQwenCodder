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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('player', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  this.player = this.physics.add.sprite(400, 300, 'player');
  
  // 设置精灵速度：向右上移动
  this.player.setVelocity(100, -100);

  // 设置世界边界，让场景足够大以便观察相机跟随效果
  this.physics.world.setBounds(0, 0, 2000, 2000);
  this.player.setCollideWorldBounds(true);
  this.player.setBounce(1, 1); // 碰到边界反弹

  // 相机跟随玩家并居中
  this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 2000, 2000);

  // 添加一些参考网格，方便观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格
  for (let x = 0; x <= 2000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 2000);
  }
  for (let y = 0; y <= 2000; y += 100) {
    gridGraphics.lineBetween(0, y, 2000, y);
  }

  // 添加文本提示
  const text = this.add.text(10, 10, '绿色方块自动移动\n相机跟随居中', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图中
}

function update(time, delta) {
  // 游戏逻辑由物理系统自动处理
  // 方块会持续移动，碰到边界会反弹
}

new Phaser.Game(config);