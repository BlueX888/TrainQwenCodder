class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.distanceFromEnemy = 0;
    this.isCaught = false;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家（中心位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建敌人（随机边缘位置）
    const spawnPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 }
    ];
    const randomPos = Phaser.Utils.Array.GetRandom(spawnPositions);
    this.enemy = this.physics.add.sprite(randomPos.x, randomPos.y, 'enemy');
    
    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 创建UI文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    this.distanceText = this.add.text(16, 46, 'Distance: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    this.statusText = this.add.text(400, 100, '', {
      fontSize: '32px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);
    
    // 添加说明文本
    this.add.text(400, 550, 'Arrow Keys or WASD to Move | Escape the Orange Enemy!', {
      fontSize: '16px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);
    
    // 重置游戏状态
    this.survivalTime = 0;
    this.isCaught = false;
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isCaught) {
      return;
    }
    
    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText(`Time: ${this.survivalTime}s`);
    
    // 计算玩家与敌人的距离
    this.distanceFromEnemy = Math.floor(
      Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.enemy.x, this.enemy.y
      )
    );
    this.distanceText.setText(`Distance: ${this.distanceFromEnemy}`);
    
    // 玩家移动控制（速度 360 * 1.2 = 432）
    const playerSpeed = 432;
    this.player.setVelocity(0);
    
    let moving = false;
    let velocityX = 0;
    let velocityY = 0;
    
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -playerSpeed;
      moving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = playerSpeed;
      moving = true;
    }
    
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -playerSpeed;
      moving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = playerSpeed;
      moving = true;
    }
    
    // 如果同时按下两个方向，需要归一化速度
    if (velocityX !== 0 && velocityY !== 0) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX = (velocityX / length) * playerSpeed;
      velocityY = (velocityY / length) * playerSpeed;
    }
    
    this.player.setVelocity(velocityX, velocityY);
    
    // 敌人追踪玩家（速度 360）
    const enemySpeed = 360;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);
  }

  onCatch() {
    if (this.isCaught) {
      return;
    }
    
    this.isCaught = true;
    
    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);
    
    // 显示游戏结束信息
    this.statusText.setText(`CAUGHT!\nSurvived: ${this.survivalTime}s\nPress SPACE to Restart`);
    
    // 添加重启功能
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
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