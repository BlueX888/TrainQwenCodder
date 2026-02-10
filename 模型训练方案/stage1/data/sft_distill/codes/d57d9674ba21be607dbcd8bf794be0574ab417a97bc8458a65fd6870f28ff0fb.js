class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 8;
    this.enemyIncrement = 2;
    this.enemiesRemaining = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameCompleted = true;
      this.showStatus('恭喜通关！', '#00ff00');
      return;
    }

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.enemiesRemaining = enemyCount;

    // 清空之前的敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子确保可重现）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 简单的伪随机算法（线性同余）
      const x = ((seed + i * 1234) % 700) + 50;
      const y = ((seed + i * 5678) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 111) % 100) - 50,
        ((seed + i * 222) % 100) - 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();

    // 显示关卡开始信息
    this.showStatus(`第 ${this.currentLevel} 关开始！`, '#ffff00', 2000);
  }

  hitEnemy(player, enemy) {
    // 敌人被消灭
    enemy.destroy();
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否清空所有敌人
    if (this.enemiesRemaining <= 0) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel} / ${this.maxLevel}`);
    this.enemyCountText.setText(`敌人: ${this.enemiesRemaining}`);
  }

  showStatus(text, color, duration = 0) {
    this.statusText.setText(text);
    this.statusText.setColor(color);
    this.statusText.setVisible(true);

    if (duration > 0) {
      this.time.delayedCall(duration, () => {
        this.statusText.setVisible(false);
      });
    }
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    game,
    getGameState: () => ({
      currentLevel: game.scene.scenes[0].currentLevel,
      enemiesRemaining: game.scene.scenes[0].enemiesRemaining,
      maxLevel: game.scene.scenes[0].maxLevel,
      gameCompleted: game.scene.scenes[0].gameCompleted
    })
  };
}