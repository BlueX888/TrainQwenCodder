class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.remainingEnemies = 0;
    this.player = null;
    this.enemies = null;
    this.levelText = null;
    this.enemyCountText = null;
    this.cursors = null;
  }

  preload() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

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

    // 游戏完成标志
    this.gameComplete = false;

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清除旧敌人
    if (this.enemies) {
      this.enemies.clear(true, true);
    }

    // 计算当前关卡敌人数量：第1关5个，每关增加2个
    this.enemiesPerLevel = 5 + (this.currentLevel - 1) * 2;
    this.remainingEnemies = this.enemiesPerLevel;

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 使用固定种子生成敌人位置（保证确定性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 使用伪随机算法生成位置
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(28, 28);
      
      // 给敌人随机速度
      const vx = ((seed + i * 173) % 100) - 50;
      const vy = ((seed + i * 197) % 100) - 50;
      enemy.setVelocity(vx, vy);
      enemy.setBounce(1);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.collectEnemy,
      null,
      this
    );

    // 更新UI
    this.updateUI();
  }

  collectEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0) {
      if (this.currentLevel < this.maxLevel) {
        // 进入下一关
        this.currentLevel++;
        this.time.delayedCall(500, () => {
          this.startLevel();
        });
      } else {
        // 游戏胜利
        this.gameComplete = true;
        this.showVictory();
      }
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.enemiesPerLevel}`);
  }

  showVictory() {
    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示胜利文本
    const victoryText = this.add.text(400, 300, 'VICTORY!\nAll Levels Complete!', {
      fontSize: '48px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 },
      align: 'center'
    });
    victoryText.setOrigin(0.5);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
  }

  update() {
    if (this.gameComplete) {
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

const game = new Phaser.Game(config);

// 导出状态用于验证
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    remainingEnemies: scene.remainingEnemies,
    enemiesPerLevel: scene.enemiesPerLevel,
    gameComplete: scene.gameComplete
  };
};