// 初始化全局信号对象
window.__signals__ = {
  gameState: 'playing', // playing, gameover
  survivalTime: 0,
  enemyCount: 20,
  playerHealth: 100,
  collisionCount: 0,
  lastUpdateTime: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemies = null;
    this.cursors = null;
    this.playerSpeed = 200;
    this.enemySpeed = 80;
    this.survivalTimer = 0;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 12, 12);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成20个敌人，随机分布在边缘
    for (let i = 0; i < 20; i++) {
      let x, y;
      const edge = Phaser.Math.Between(0, 3);
      
      switch(edge) {
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
      enemy.setCollideWorldBounds(false);
    }

    // 设置玩家与敌人的碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    console.log('Game Started:', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTimer += delta;
    window.__signals__.survivalTime = Math.floor(this.survivalTimer / 1000);
    window.__signals__.lastUpdateTime = time;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 归一化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active) {
        // 计算敌人到玩家的角度
        const angle = Phaser.Math.Angle.Between(
          enemy.x, enemy.y,
          this.player.x, this.player.y
        );

        // 设置敌人朝向玩家的速度
        this.physics.velocityFromRotation(angle, this.enemySpeed, enemy.body.velocity);

        // 旋转敌人面向玩家（可选）
        enemy.rotation = angle;
      }
    });

    // 更新信息显示
    this.infoText.setText(
      `Survival Time: ${window.__signals__.survivalTime}s\n` +
      `Enemies: ${window.__signals__.enemyCount}\n` +
      `Health: ${window.__signals__.playerHealth}\n` +
      `Use Arrow Keys to Move`
    );
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;
    window.__signals__.gameState = 'gameover';
    window.__signals__.collisionCount++;
    window.__signals__.playerHealth = 0;

    // 停止所有物理对象
    this.physics.pause();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(400, 380, 'Survived: ' + window.__signals__.survivalTime + 's', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    restartText.setOrigin(0.5);

    // 输出最终状态
    console.log('Game Over:', JSON.stringify(window.__signals__));
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

const game = new Phaser.Game(config);