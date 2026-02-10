class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.isInvulnerable = false;
    this.hitCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff8800, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家（橙色角色）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建敌人（从左侧移动）
    this.enemy = this.physics.add.sprite(100, 300, 'enemy');
    this.enemy.setVelocityX(160);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 创建UI显示
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    this.hitCountText = this.add.text(16, 50, `Hit Count: ${this.hitCount}`, {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 84, 'Status: Normal', {
      fontSize: '20px',
      fill: '#0f0',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，不处理碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 减少生命值
    this.health--;
    this.hitCount++;
    this.healthText.setText(`Health: ${this.health}`);
    this.hitCountText.setText(`Hit Count: ${this.hitCount}`);

    // 设置无敌状态
    this.isInvulnerable = true;
    this.statusText.setText('Status: Invulnerable');
    this.statusText.setStyle({ fill: '#ff0' });

    // 计算击退方向
    const knockbackSpeed = 160;
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );
    
    // 应用击退效果
    const knockbackX = Math.cos(angle) * knockbackSpeed * 2;
    const knockbackY = Math.sin(angle) * knockbackSpeed * 2;
    
    player.setVelocity(knockbackX, knockbackY);

    // 创建闪烁效果（1.5秒）
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      ease: 'Linear',
      yoyo: true,
      repeat: 14, // 重复14次，总共15个循环（100ms * 15 * 2 = 1500ms）
      onComplete: () => {
        // 闪烁结束，恢复正常
        player.alpha = 1;
        this.isInvulnerable = false;
        this.statusText.setText('Status: Normal');
        this.statusText.setStyle({ fill: '#0f0' });
      }
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: Game Over!');
      this.statusText.setStyle({ fill: '#f00' });
      this.physics.pause();
      
      // 3秒后重启
      this.time.delayedCall(3000, () => {
        this.scene.restart();
      });
    }
  }

  update(time, delta) {
    // 玩家控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 敌人边界反弹
    if (this.enemy.x <= 30 || this.enemy.x >= 770) {
      this.enemy.setVelocityX(-this.enemy.body.velocity.x);
    }
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