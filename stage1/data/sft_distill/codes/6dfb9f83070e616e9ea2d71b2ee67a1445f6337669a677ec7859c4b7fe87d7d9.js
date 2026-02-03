// 完整的 Phaser3 代码 - 相机跟随移动方块
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
let cursors;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBox', 50, 50);
  graphics.destroy();

  // 创建一个更大的世界边界，让方块可以移动
  this.physics.world.setBounds(-2000, 0, 4000, 600);

  // 创建玩家精灵（方块）
  player = this.physics.add.sprite(400, 300, 'playerBox');
  player.setCollideWorldBounds(true);

  // 设置方块向左移动
  player.setVelocityX(-150);

  // 设置相机跟随方块
  this.cameras.main.startFollow(player);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(-2000, 0, 4000, 600);

  // 添加一些参考点（静态方块）来显示相机移动效果
  for (let i = -2000; i < 2000; i += 200) {
    const refGraphics = this.add.graphics();
    refGraphics.lineStyle(2, 0xffffff, 0.3);
    refGraphics.strokeRect(i, 100, 100, 100);
    
    // 添加坐标文本
    const text = this.add.text(i + 10, 110, `X: ${i}`, {
      fontSize: '14px',
      color: '#ffffff',
      alpha: 0.5
    });
  }

  // 添加提示文本（固定在相机上）
  const instructions = this.add.text(10, 10, '方块自动向左移动\n相机跟随方块', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructions.setScrollFactor(0); // 固定在相机上，不随场景滚动

  // 添加键盘控制（可选：允许改变方向）
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 可选：添加键盘控制改变移动方向
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }

  // 如果只想保持自动向左移动，可以注释掉上面的键盘控制
  // 并取消注释下面这行
  // player.setVelocityX(-150);
}

// 创建游戏实例
new Phaser.Game(config);