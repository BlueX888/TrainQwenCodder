class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.isGameOver = false;
    this.startTime = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    this.startTime = this.time.now;
    this.isGameOver = false;
    this.survivalTime = 0;

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(500);
    this.player.setMaxVelocity(300);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成 20 个敌人，随机分布在边缘
    for (let i = 0; i < 20; i++) {
      let x, y;
      const side = Phaser.Math.Between(0, 3);
      
      switch(side) {
        case 0: // 上边
          x = Phaser.Math.Between(0, 800);
          y = 0;
          break;
        case 1: // 右边
          x = 800;
          y = Phaser.Math.Between(0, 600);
          break;
        case 2: // 下边
          x = Phaser.Math.Between(0, 800);
          y = 600;
          break;
        case 3: // 左边
          x = 0;
          y = Phaser.Math.Between(0, 600);
          break;
      }
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.2);
    }

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 提示文本
    this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText('Time: ' + this.survivalTime + 's');

    // 玩家控制
    const acceleration = 400;
    
    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 200);
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    // 停止所有移动
    player.setVelocity(0, 0);
    player.setAcceleration(0, 0);
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束信息
    this.gameOverText.setText('GAME OVER!\nSurvived: ' + this.survivalTime + 's\nPress R to Restart');
    this.gameOverText.setVisible(true);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
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