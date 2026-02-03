class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collisionCount = 0;
    this.distance = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（黄色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xffff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleCollision, null, this);

    // 创建状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动 - 玩家速度: 360, 敌人速度: 300', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    console.log('Game started - Player speed: 360, Enemy speed: 300');
  }

  update(time, delta) {
    // 玩家移动控制 - 速度 300 * 1.2 = 360
    const playerSpeed = 360;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家 - 速度 300
    const enemySpeed = 300;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 计算玩家和敌人之间的距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x, 
      this.player.y, 
      this.enemy.x, 
      this.enemy.y
    );

    // 更新状态显示
    this.statusText.setText([
      `碰撞次数: ${this.collisionCount}`,
      `距离: ${Math.floor(this.distance)}px`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `敌人位置: (${Math.floor(this.enemy.x)}, ${Math.floor(this.enemy.y)})`
    ]);
  }

  handleCollision(player, enemy) {
    this.collisionCount++;
    
    // 碰撞时短暂停止敌人
    enemy.setVelocity(0);
    
    // 将敌人推开一段距离
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    enemy.x -= Math.cos(angle) * 50;
    enemy.y -= Math.sin(angle) * 50;

    console.log(`Collision detected! Count: ${this.collisionCount}, Distance: ${Math.floor(this.distance)}`);

    // 闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);